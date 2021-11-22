import React, { useEffect, useState } from "react";
import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from "@dnd-kit/core";

import {
  SortableContext,
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
  arrayMove
} from "@dnd-kit/sortable";

import { removeAtIndex, insertAtIndex } from "../../utils.js";

import { NavItemCard } from "../NavCard";
import { NavItemsContainer } from "../NavItemsContainer";

import "../../styles/App.css";

export function NavContainer() {
  const [navList, setNavList] = useState([]);
  const [active, setActive] = useState(null);
  const [nav, setNav] = useState(null);

  useEffect(() => {
    fetch("db.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error("HTTP error");
        }
        return response.json();
      })
      .then((data) => setNavList(data))
      .catch((e) => {
        console.log(e, "error");
      });
  }, []);

  function findContainer(id, type = "") {
    let result = null;

    if (id) {
      if (id in navList) {
        return id;
      }
      if (type === "menu") {
        result = navList.find((nav) => nav.id === id);
      } else if (type === "subMenu") {
        result = navList.find((nav) => {
          if (nav.SubMenus && nav.SubMenus.length > 0) {
            return nav.SubMenus.find((sub) => {
              return sub.id === id;
            });
          }
          return result;
        });
      }
    }
    return result;
  }

  function handleDragStart(event) {
    setActive(event.active.id);
    setNav(event.active.data.current);
  }

  function handleDragEnd(event) {
    const { active, over } = event;
    const { id } = active;
    const activeType = active.data.current.type;
    let overId = null;
    let overType = null;
    if (over) {
      overId = over.id;
      overType = over.data.current.type;
    }
    // Find the containers
    const activeContainer = findContainer(id, activeType);
    const overContainer = findContainer(overId, overType);

    if (!activeContainer || !overContainer) {
      return;
    }

    if (overType === "menu") {
      if (active.id !== over.id) {
        if (activeType === "menu") {
          setNavList((items) => {
            const oldIndex = items.findIndex((item) => item.id === active.id);
            const newIndex = items.findIndex((item) => item.id === over.id);
            return arrayMove(items, oldIndex, newIndex);
          });
        } else if (
          (activeType === "subMenu" && !over.data.current.item["SubMenus"]) ||
          !over.data.current.item["SubMenus"].length > 0
        ) {
          //add SubMenu
          let newItems;
          const subList = activeContainer.SubMenus;
          const activeIndex = subList.findIndex((sub) => sub.id === active.id);
          const overIndex = navList.findIndex((item) => item.id === over.id);
          const activeContainerIndex = navList.findIndex(
            (container) => container.id === activeContainer.id
          );
          newItems = moveBetweenContainers(
            navList,
            activeContainer,
            activeIndex,
            overContainer,
            overIndex,
            active,
            activeContainerIndex,
            overIndex
          );
          setNavList(Object.values(newItems));
        } else {
          return;
        }
      }
    } else if (overType === "subMenu" && activeType === "subMenu") {
      if (active.id !== over.id) {
        if (activeContainer.id === overContainer.id) {
          console.log("same container move");
          const subList = activeContainer.SubMenus;
          const oldIndex = subList.findIndex((sub) => sub.id === active.id);
          const newIndex = subList.findIndex((sub) => sub.id === over.id);

          const updatedSubList = arrayMove(subList, oldIndex, newIndex);
          const updatedNavList = navList.map((nav) => {
            if (nav.id === activeContainer.id) {
              nav["SubMenus"] = updatedSubList;
            }
            return nav;
          });

          setNavList(updatedNavList);
        } else {
          console.log("different container move");
          let newItems;
          const activeSubList = activeContainer.SubMenus;
          const overSubList = overContainer.SubMenus;
          const activeContainerIndex = navList.findIndex(
            (container) => container.id === activeContainer.id
          );
          const overContainerIndex = navList.findIndex(
            (container) => container.id === overContainer.id
          );
          const activeIndex = activeSubList.findIndex(
            (sub) => sub.id === active.id
          );
          const overIndex = overSubList.findIndex((sub) => sub.id === over.id);
          newItems = moveBetweenContainers(
            navList,
            activeContainer,
            activeIndex,
            overContainer,
            overIndex,
            active,
            activeContainerIndex,
            overContainerIndex
          );
          setNavList(Object.values(newItems));
        }
      }
    }
    setActive(null);
    setNav(null);
  }

  const moveBetweenContainers = (
    items,
    activeContainer,
    activeIndex,
    overContainer,
    overIndex,
    item,
    activeContainerIndex,
    overContainerIndex
  ) => {
    const updatedList = {
      ...items,
      [activeContainerIndex]: {
        ...activeContainer,
        SubMenus: removeAtIndex(
          items[activeContainerIndex]["SubMenus"],
          activeIndex
        )
      },
      [overContainerIndex]: {
        ...overContainer,
        SubMenus: insertAtIndex(
          items[overContainerIndex]["SubMenus"],
          overIndex,
          item.data.current.item
        )
      }
    };
    return updatedList;
  };

  function handleDragOver(event) {
    const { active, over } = event;
    const { id } = active;
    const activeType = active.data.current.type;
    let overId = null;
    let overType = null;
    if (over) {
      overId = over.id;
      overType = over.data.current.type;
    }
    // Find the containers
    const activeContainer = findContainer(id, activeType);
    const overContainer = findContainer(overId, overType);

    if (
      !activeContainer ||
      !overContainer ||
      activeContainer?.id === overContainer?.id
    ) {
      return;
    }
  }

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
    >
      <div className="navContainer">
        <SortableContext
          items={navList}
          strategy={horizontalListSortingStrategy}
        >
          {navList.map((nav, index) => {
            return (
              <div className="drop-container" key={nav.id}>
                <NavItemsContainer
                  list={nav.SubMenus || []}
                  id={nav.id}
                  item={nav}
                  lastMenu={index === navList.length - 1}
                  hasSubmenu={nav.SubMenus && nav.SubMenus.length > 0}
                />
              </div>
            );
          })}
        </SortableContext>
      </div>
      <DragOverlay>
        {active ? (
          <div className="navCard navCardDragging">
            <NavItemCard
              name={nav.item.Name}
              isSubMenu={nav.type === "subMenu" ? true : false}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

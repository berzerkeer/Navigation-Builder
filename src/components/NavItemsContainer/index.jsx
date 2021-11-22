import React from "react";
import { useDraggable, useDroppable } from "@dnd-kit/core";

import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable
} from "@dnd-kit/sortable";

import { NavItemCard } from "../NavCard";

import { ReactComponent as PlusIcon } from "../../icons/plus.svg";
import { ReactComponent as BigPlusIcon } from "../../icons/bigplus.svg";
import "../../styles/App.css";

export function NavItemsContainer(props) {
  const { item, lastMenu, hasSubmenu, list } = props;

  const {
    attributes,
    listeners,
    setNodeRef: setDraggableNodeRef,
    isDragging
  } = useDraggable({
    id: item.id,
    data: { item, lastMenu, hasSubmenu, type: "menu" }
  });

  const { isOver, setNodeRef: setDroppableNodeRef } = useDroppable({
    id: item.id,
    data: {
      type: "menu",
      item: item
    }
  });

  const dropStyle = {
    borderLeft: isOver ? "4px solid #a6b6cc" : undefined
  };

  const dragStyle = { opacity: isDragging ? "0.5" : 1 };

  // sub drop style

  const {
    isOver: subIsOver,
    setDroppableNodeRef: setSubDroppableNodeRef
  } = useSortable({
    id: `SubMenu${item.id}`
  });

  const subDropStyle = {
    height: "4px",
    backgroundColor: subIsOver ? "#a6b6cc" : "transparent",
    width: "180px",
    margin: "8px 0px 8px 15px",
    borderRadius: "8px"
  };

  return (
    <div
      className="navItemsContainer"
      style={isDragging ? dragStyle : dropStyle}
    >
      <div className="navCardMenu" ref={setDroppableNodeRef}>
        <div className="mainMenu">
          <div className="navCard" ref={setDraggableNodeRef}>
            <NavItemCard
              name={item.Name}
              listeners={listeners}
              attributes={attributes}
            />
          </div>
          <span className={`${!lastMenu && "hidePlus"} addMenuIcon`}>
            <BigPlusIcon />
          </span>
        </div>
      </div>
      <div className={`navCardSubMenu ${!hasSubmenu && "increase"}`}>
        <SortableContext
          id={`SubMenu${item.id}`}
          items={list}
          strategy={verticalListSortingStrategy}
        >
          <div
            className={`subMenu ${!hasSubmenu ? "hide" : ""}`}
            ref={setSubDroppableNodeRef}
          >
            {list?.length > 0 &&
              list.map((subMenu) => {
                return (
                  <div key={subMenu.id}>
                    <div style={subDropStyle}></div>
                    <div className="navSubMenuCard">
                      <NavItemCard
                        id={subMenu.id}
                        name={subMenu.Name}
                        item={subMenu}
                        isSubMenu
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </SortableContext>
        <div className="addSubMenu">
          <span className="addSubMenuIcon">
            <PlusIcon />
          </span>
          <p className="addSubMenuLabel">Add sub-menu</p>
        </div>
      </div>
    </div>
  );
}

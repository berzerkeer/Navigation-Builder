import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { ReactComponent as DragDropIcon } from "../../icons/drag-and-drop.svg";
import { ReactComponent as SmallDragDropIcon } from "../../icons/small-drag-and-drop.svg";

import "../../styles/App.css";

export function NavItemCard(props) {
  const { name, isSubMenu, item, id, listeners, attributes } = props;

  const {
    attributes: subAttributes,
    listeners: subListeners,
    setNodeRef,
    isDragging
  } = useSortable({
    id: id,
    data: {
      item,
      name,
      type: "subMenu"
    }
  });

  const dragStyle = { opacity: isDragging && isSubMenu ? "0.5" : 1 };

  return (
    <div className="navCardContent" ref={setNodeRef} style={dragStyle}>
      <span className="navInputIcon">
        {isSubMenu ? (
          <SmallDragDropIcon
            className="subMenuIcon"
            {...subListeners}
            {...subAttributes}
          />
        ) : (
          <DragDropIcon
            className="mainMenuIcon"
            {...listeners}
            {...attributes}
          />
        )}
      </span>
      <p className="navMenuName">{name}</p>
    </div>
  );
}

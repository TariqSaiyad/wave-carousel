import React from "react";
import "./Toggle.scss";
function Toggle(props) {
  return (
    <div className="switch">
      <span>
        <input
          type="checkbox"
          id="toggleInput"
          disabled={props.disabled}
          checked={props.checked}
          onChange={(e) => props.onChange(e.target.checked)}
          />
        <button
          className="slider"
          type="button"
          disabled={props.disabled}
          onClick={() => props.onChange(!props.checked)}
        ></button>
      </span>
      <label className="slider-label" htmlFor="toggleInput">{props.title}</label>
    </div>
  );
}
export default Toggle;

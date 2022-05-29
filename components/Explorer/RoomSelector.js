import React from "react";
import {
  Dropdown,
  DropdownButton,
  FormControl,
  InputGroup,
} from "react-bootstrap";

export default function RoomSelector({
  items = [],
  placeholder = "Make a new room",
  onChange = () => {},
  value,
}) {
  return (
    <>
      <InputGroup className="mb-3">
        <DropdownButton
          variant="outline-secondary"
          title="Rooms"
          id="input-group-dropdown-1"
        >
          {items.map((i) => {
            if (typeof i === "object")
              return (
                <Dropdown.Item key={i.value} onClick={() => onChange(i.value)}>
                  {i.name}
                </Dropdown.Item>
              );
            return (
              <Dropdown.Item key={i} onClick={() => onChange(i)}>
                {i}
              </Dropdown.Item>
            );
          })}
        </DropdownButton>
        <FormControl
          aria-label="New room"
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          value={value}
        />
        {/* <Form.Select
          onChange={(e) => {
            onChange(e.target.value);
          }}
          value={value}
        >
          <option>{placeholder}</option>
          {items.map((i) => {
            if (typeof i === "object")
              return (
                <option key={i.value} value={i.value}>
                  {i.name}
                </option>
              );
            return (
              <option key={i} value={i}>
                {i}
              </option>
            );
          })}
        </Form.Select> */}
      </InputGroup>
    </>
  );
}

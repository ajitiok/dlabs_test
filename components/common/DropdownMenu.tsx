import cx from "classnames";
import React, { useState } from "react";
import { Popover, PopoverProps } from "react-tiny-popover";

type Props = Omit<PopoverProps, "isOpen"> & {
  disabled?: boolean;
};

const DropdownMenu: React.FC<Props> = ({
  children,
  reposition = true,
  positions = ["bottom", "top"],
  disabled = false,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <Popover
      {...props}
      reposition={reposition}
      positions={positions}
      isOpen={isOpen}
      onClickOutside={() => setIsOpen(false)}
    >
      <button
        type="button"
        className={cx(
          `border border-base-300 rounded-md p-1 outline-none hover:bg-base-200`,
          {
            "bg-base-200": isOpen || disabled,
          }
        )}
        onClick={() => {
          if (disabled) return;
          setIsOpen((prev) => !prev);
        }}
      >
        {children}
      </button>
    </Popover>
  );
};

export default DropdownMenu;

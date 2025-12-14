'use client';

import React, { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { clsx } from 'clsx';

interface DropdownMenuProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: 'left' | 'right';
  className?: string;
}

interface DropdownItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  className?: string;
  disabled?: boolean;
}

export function DropdownMenu({ 
  trigger, 
  children, 
  align = 'right',
  className 
}: DropdownMenuProps) {
  return (
    <Menu as="div" className={clsx("relative inline-block text-left", className)}>
      <Menu.Button as={Fragment}>
        {trigger}
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items 
          className={clsx(
            "absolute z-50 mt-2 w-56 origin-top-right rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none",
            {
              "right-0": align === 'right',
              "left-0": align === 'left'
            }
          )}
        >
          <div className="py-1">
            {children}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}

export function DropdownItem({ 
  children, 
  onClick, 
  href, 
  className,
  disabled = false 
}: DropdownItemProps) {
  return (
    <Menu.Item disabled={disabled}>
      {({ active }) => (
        href ? (
          <a
            href={href}
            className={clsx(
              "block px-4 py-2 text-sm",
              {
                "bg-gray-100 text-gray-900": active && !disabled,
                "text-gray-700": !active && !disabled,
                "text-gray-400 cursor-not-allowed": disabled
              },
              className
            )}
          >
            {children}
          </a>
        ) : (
          <button
            onClick={onClick}
            disabled={disabled}
            className={clsx(
              "block w-full text-left px-4 py-2 text-sm",
              {
                "bg-gray-100 text-gray-900": active && !disabled,
                "text-gray-700": !active && !disabled,
                "text-gray-400 cursor-not-allowed": disabled
              },
              className
            )}
          >
            {children}
          </button>
        )
      )}
    </Menu.Item>
  );
}
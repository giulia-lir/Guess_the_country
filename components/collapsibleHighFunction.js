import React, { useState } from 'react';

export default function withCollapsibleState(WrappedComponent) {
  return function CollapsibleWrapper(props) {
    const [isCollapsed, setCollapsed] = useState(false);

    const openCollapsible = () => {
      setCollapsed(!isCollapsed);
    };

    return (
      <WrappedComponent
        {...props}
        isCollapsed={isCollapsed}
        openCollapsible={openCollapsible}
      />
    );
  };
};
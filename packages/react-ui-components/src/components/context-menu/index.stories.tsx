import { ContextMenu, Item, Separator, Submenu, useContextMenu, ItemParams, RightSlot } from './';

import './styles';
import { Meta, StoryObj } from '@storybook/react';

const MENU_ID = 'menu-id';

const meta: Meta<typeof ContextMenu> = {
  component: ContextMenu,
};

type Story = StoryObj<typeof ContextMenu>;

function ContextMenuExample() {
  // 🔥 you can use this hook from everywhere. All you need is the menu id
  const { show } = useContextMenu({
    id: MENU_ID,
  });

  const handleItemClick = ({ event, props, triggerEvent, data }: ItemParams) => {
    console.log(event, props, triggerEvent, data);
  };

  const containerStyle = {
    width: '100%',
    height: '100vh',
    background: 'lightblue',
    fontFamily: 'Helvetica',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  };

  return (
    <div style={containerStyle} className="menuContainer" onContextMenu={(e) => show({ event: e })}>
      Right click anywhere
      <ContextMenu animation={{enter: 'scale', exit: 'fade'}} id={MENU_ID}>
        <Item onClick={handleItemClick}>
          Item 1
          <RightSlot>With Right Slot</RightSlot>
         </Item>
        <Item onClick={handleItemClick}>Item 2</Item>
        <Separator />
        <Item disabled>Disabled</Item>
        <Separator />
        <Submenu label="Submenu" arrow="🦄">
          <Item onClick={handleItemClick}>Sub Item 1</Item>
          <Item onClick={handleItemClick}>Sub Item 3</Item>
            <Submenu label="Submenu" arrow="🤘">
              <Item onClick={handleItemClick}>Sub Item 4</Item>
              <Item onClick={handleItemClick}>Sub Item 5</Item>
            </Submenu>
        </Submenu>
        <Submenu label="Submenu" arrow=">">
          <Item onClick={handleItemClick}>Sub Item 1</Item>
          <Item onClick={handleItemClick}>Sub Item 3</Item>
            <Submenu label="Submenu" arrow="🤘">
              <Item onClick={handleItemClick}>Sub Item 4</Item>
              <Item onClick={handleItemClick}>Sub Item 5</Item>
            </Submenu>
        </Submenu>
      </ContextMenu>
    </div>
  );
}

export const contextMenuStory: Story = {
  render: () => (
    <>
      <ContextMenuExample />
    </>
  ),
};

export default meta;

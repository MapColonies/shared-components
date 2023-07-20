export const calcSubMenuPositioning = (contextEvt: MouseEvent, isRtl: boolean) => {
  const containerElem = contextEvt.target as HTMLElement;
  const { clientWidth } = containerElem;
  const contextMenuContainer = document.querySelector('.context-menu-container');
  if(contextMenuContainer) {
    // remove prev styles to recalculate
    const prevStyleElem = document.head.querySelector('style[contextMenuRTLStyle="true"]');
    prevStyleElem?.remove();

    const containerStyles = getComputedStyle(contextMenuContainer);
    const menuMinWidth = Number(containerStyles?.getPropertyValue('--contexify-menu-minWidth')?.match(/(\d+)/)?.[0]);
    const clickPosition = {x: contextEvt.clientX, y: contextEvt.clientY};
    const TEST_PADDING = 20;
    const overflowXEnd = clickPosition.x + menuMinWidth > clientWidth - TEST_PADDING;
    const overflowXStart = clickPosition.x - menuMinWidth < 0;
    const headElement = document.head;
    const overrideStyle = document.createElement('style');
    overrideStyle.dataset.contextMenuRTLStyle = "true";
    headElement.appendChild(overrideStyle);
    const defaultSubmenuPositioning = isRtl ? `left: 100%; right: unset;`: `left: unset; right: 100%;`;
    const defaultStyleForSubMenu = `.contexify .contexify_submenu {${defaultSubmenuPositioning}}`;
    let overrideCss = defaultStyleForSubMenu;

    if(isRtl && !overflowXStart) {
      overrideCss = `.contexify .contexify_submenu {left: unset; right: 100%;}`;
    } else if(!isRtl && !overflowXEnd) {
      overrideCss = `.contexify .contexify_submenu {left: 100%; right: unset;}`;
    }

    overrideStyle.appendChild(document.createTextNode(overrideCss));
  }
}
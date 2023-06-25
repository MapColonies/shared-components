/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { FabProps as RMWCFabProps, Fab as RMWCFab} from '@rmwc/fab';
import '@rmwc/fab/styles';


export interface FabProps extends React.ComponentProps<typeof RMWCFab>{};

export const Fab: React.FC<FabProps> = React.forwardRef<any, FabProps>((props, ref) => {

return <RMWCFab ref={ref} {...props} />

});
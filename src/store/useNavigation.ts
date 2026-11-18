import { useState, useEffect } from 'react';
import { navigationStore, NavigationState } from './navigationStore';

export function useNavigation(): NavigationState {
  const [state, setState] = useState<NavigationState>(navigationStore.getState());

  useEffect(() => {
    const unsubscribe = navigationStore.subscribe((newState) => {
      setState(newState);
    });
    return unsubscribe;
  }, []);

  return state;
}

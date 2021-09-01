import { useEffect, useCallback, useState, useRef } from 'react';
import type { SetStateAction } from 'react';

type Callback<T> = (value?: T) => void;
type DispatchWithCallback<T> = (value: SetStateAction<T>, callback?: Callback<T>) => void;

//* 自定义 setState 回调函数
function useStateCB<T>(initialState: T | (() => T)): [T, DispatchWithCallback<T>] {
  const [state, _setState] = useState<T>(initialState);

  const callbackRef = useRef<Callback<T>>();
  const isFirstCallbackCall = useRef<boolean>(true);

  useEffect(() => {
    if (isFirstCallbackCall.current) {
      isFirstCallbackCall.current = false;
      return;
    }
    callbackRef.current?.(state);
  }, [state]);

  const setState = useCallback((setStateAction: SetStateAction<T>, callback?: Callback<T>): void => {
    callbackRef.current = callback;
    _setState(setStateAction);
  }, []);

  return [state, setState];
}

export default useStateCB;

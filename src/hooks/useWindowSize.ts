import { useEffect, useState } from 'react';


function useWindowSize(onSizeUpdated: () => void) {

  useEffect(() => {

    let timeoutId = 0
    const debouncedUpdate = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(onSizeUpdated, 150);
    };

    window.addEventListener('resize', debouncedUpdate);

    onSizeUpdated();

    return () => window.removeEventListener('resize', debouncedUpdate);
  }, [onSizeUpdated]);

}

export default useWindowSize;
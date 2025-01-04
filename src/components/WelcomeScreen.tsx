import { useEffect, useState } from 'react';

export const WelcomeScreen = () => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className="welcome-animation">
      <div className="welcome-text">
مـجتمع دولاب     </div>
    </div>
  );
};
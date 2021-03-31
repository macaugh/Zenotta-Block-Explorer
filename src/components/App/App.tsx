import React from 'react';
import * as styles from "./App.scss";

interface AppProps {
  name: string;
}

export default function App({ name }: AppProps) {
  return (
    <div className={styles.container}>
      Hello {name}
    </div>
  );
}

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import reactLogo from './assets/react.svg';
import './App.css';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="text-center mt-5">
      <h1 className="text-3xl font-bold">
        Electron + Vite + React + Typescript + TailWindCSS + ShadCN
      </h1>
      <div className="flex justify-center items-center my-5">
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="w-32 h-32" alt="React logo" />
        </a>
      </div>
      <div className="card">
        <Button
          className="mb-10 mt-5 cursor-pointer"
          variant="outline"
          onClick={() => setCount((count) => count + 1)}
        >
          count is {count}
        </Button>
        <p>
          Edit <code>src/ui/App.tsx</code> to change the page
        </p>

        <p>
          You can add ShadCN elements using{' '}
          <code>npx shadcn@latest add element</code>
        </p>
      </div>
    </div>
  );
}

export default App;

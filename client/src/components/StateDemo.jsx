import { useState } from 'react';
export default function StateDemo() {
  let regularCount = 0;
  const [stateCount, setStateCount] = useState(0);
  function increaseRegularCount() {
    regularCount++;
    console.log("Regular:", regularCount);
  }
  function increaseStateCount() {
    setStateCount(stateCount + 1);
  }
  return (
    <div>
      <h2>Regular Variable vs State Variable</h2>
      <p>Regular Count: {regularCount}</p>
      <button onClick={increaseRegularCount}>
        Increase Regular Count
      </button>
      <p>State Count: {stateCount}</p>
      <button onClick={increaseStateCount}>
        Increase State Count
      </button>
    </div>
  );
}
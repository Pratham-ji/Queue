const fs = require('fs');
const file = '/Users/pratham/Projects/Queue/apps/user-mobile/src/screens/create/CustomSessionScreen.tsx';
let code = fs.readFileSync(file, 'utf8');

// 1. Fix the socket listener
code = code.replace(
  /socket\.on\("queue_updated", \(updatedPerson\) => \{[\s\S]*?\}\);/m,
  `socket.on("custom_queue_updated", (fullQueue) => {
      setQueue(fullQueue);
    });`
);

fs.writeFileSync(file, code);

const fs = require('fs');
const file = '/Users/pratham/Projects/Queue/apps/provider-mobile/src/screens/dashboard/DashboardScreen.tsx';
let code = fs.readFileSync(file, 'utf8');

const regex = /style=\\{\\[styles\.fabContainer, \{ marginTop: 24, marginBottom: 32 \}\\]\\}/;
code = code.replace(regex, 'style={[styles.fabContainer, { marginTop: 16, marginBottom: 32 }]}');

// Wait, let's verify if `fabContainer` has horizontal margins.
// The prompt asks to "Restrict its width to match the exact dimensions of the blue Hero Card above it (e.g., marginHorizontal: 20 or width: '100%')"
code = code.replace(/fabContainer: \{[\s\S]*?\},/, (match) => {
  if (!match.includes('marginHorizontal')) {
    return match.replace('},', '  marginHorizontal: 24,\n  },');
  }
  return match;
});

fs.writeFileSync(file, code);

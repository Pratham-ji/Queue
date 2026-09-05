const fs = require('fs');
const file = '/Users/pratham/Projects/Queue/apps/provider-mobile/src/screens/dashboard/DashboardScreen.tsx';
let code = fs.readFileSync(file, 'utf8');

const sliderChunk = `        {/* INLINE ACTION BUTTON - SLIDE TO CALL */}
        {queue.length > 0 && (
          <Animatable.View
            animation="fadeInUp"
            duration={500}
            style={styles.fabContainer}
          >
            <SlideToCall 
              onTrigger={handleCallNext} 
              disabled={!isOnline} 
            />
          </Animatable.View>
        )}`;

// Remove the slider from its original position
code = code.replace(sliderChunk, '');

// Insert it above {/* UP NEXT LIST */}
const insertPos = `{/* UP NEXT LIST */}`;
const modifiedSliderChunk = `        {/* INLINE ACTION BUTTON - SLIDE TO CALL */}
        {queue.length > 0 && (
          <Animatable.View
            animation="fadeInUp"
            duration={500}
            style={[styles.fabContainer, { marginTop: 24, marginBottom: 32 }]}
          >
            <SlideToCall 
              onTrigger={handleCallNext} 
              disabled={!isOnline} 
            />
          </Animatable.View>
        )}
        
        `;

code = code.replace(insertPos, modifiedSliderChunk + insertPos);
fs.writeFileSync(file, code);

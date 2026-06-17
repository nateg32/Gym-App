import { WorkoutType } from './types';

export const MOTIVATIONAL_MESSAGES = {
  general: [
    "Consistency is key. You're doing great.",
    "Every session counts. Keep moving.",
    "Logged. That’s momentum.",
    "Small steps every day add up.",
    "Your future self will thank you.",
    "Showing up is 90% of the battle.",
    "Discipline equals freedom. Good work.",
    "Another one in the bank.",
    "Focus on the process, not just the result.",
    "You're building a masterpiece, one rep at a time.",
  ],
  highStreak: [
    "You are unstoppable right now!",
    "Streak on fire! 🔥 Keep the chain alive.",
    "This is what dedication looks like.",
    "Incredible consistency. Don't stop now.",
    "You're lapping everyone on the couch.",
    "Legendary status loading...",
    "Nothing can stop you today.",
  ],
  recovery: [
    "Welcome back! The comeback is always stronger.",
    "Missed a day? No drama. Next session is the reset.",
    "Back on track. Let's get it.",
    "Fresh start. Make it count.",
    "It's not about being perfect, it's about being persistent.",
  ],
  typeSpecific: {
    'Cardio': "Heart health is wealth. Great job.",
    'Strength': "Building a stronger foundation.",
    'Mobility': "Your body thanks you for the movement.",
    'HIIT': "Intense work, massive rewards.",
    'Hypertrophy': "Growing stronger, one set at a time.",
    'Sport': "Game ready. Performance focused.",
    'Rest': "Rest is when the muscles grow. Enjoy the recovery.",
    'Other': "Movement is medicine."
  } as Record<WorkoutType, string>
};

export const WORKOUT_TYPES: WorkoutType[] = [
  'Strength', 'Hypertrophy', 'Cardio', 'HIIT', 'Mobility', 'Sport', 'Rest', 'Other'
];

export const BODY_AREAS = [
  'Full Body', 'Upper', 'Lower', 'Core', 
  'Push', 'Pull', 'Legs', 'Chest', 'Back', 'Shoulders', 'Arms', 'Glutes'
];
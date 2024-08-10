export const moodValues = (value) => {
    switch (value) {
    case 0:
        return {emoji: '', label: ''};
      case 1:
        return {emoji: '😭', label: 'очень плохо', color: 'red'};
      case 2:
        return {emoji: '😞', label: 'грустно', color: 'orange'};
      case 3:
        return {emoji: '😐', label: 'нормально', color: 'yellow'};
      case 4:
        return {emoji: '😌', label: 'хорошо', color: 'yellowgreen'};
      case 5:
        return {emoji: '🤩', label: 'очень хорошо', color: 'green'};
    case 6:
        return {emoji: '', label: ''};
      default:
        return {emoji: '', label: ''};
    }
  };
import { TourConfig } from './tour-engine';

export const brandsTour: TourConfig = {
  id: 'brands-management',
  title: 'Brand Management Basics',
  description: 'Learn how to manage your brand locations and monitor their status',
  steps: [
    {
      id: 'welcome',
      target: '[data-tour="brands-header"]',
      title: 'Welcome to Brand Management',
      content: 'This is your brand dashboard where you can manage all your connected locations and monitor their real-time status.',
      position: 'bottom'
    },
    {
      id: 'brand-cards',
      target: '[data-tour="brand-card"]:first-child',
      title: 'Your Brand Locations',
      content: 'Each card represents a connected location. You can see the brand name, connection status, and quick action buttons.',
      position: 'bottom'
    },
    {
      id: 'status-indicator',
      target: '[data-tour="status-indicator"]',
      title: 'Connection Status',
      content: 'The colored dot shows real-time connectivity: Green means online and streaming, Gray means offline.',
      position: 'left'
    },
    {
      id: 'edit-button',
      target: '[data-tour="edit-button"]:first-child',
      title: 'Configure Location',
      content: 'Click the Edit button to access all settings for this location including playlists, schedules, and playback options.',
      position: 'top'
    },
    {
      id: 'add-brand',
      target: '[data-tour="add-brand-button"]',
      title: 'Add New Location',
      content: 'Use this button to connect a new brand location to your music management system.',
      position: 'bottom'
    },
    {
      id: 'search-filter',
      target: '[data-tour="search-input"]',
      title: 'Search & Filter',
      content: 'Quickly find specific locations using the search bar, especially useful when managing many brands.',
      position: 'bottom'
    },
    {
      id: 'bulk-actions',
      target: '[data-tour="bulk-actions"]',
      title: 'Bulk Management',
      content: 'Select multiple brands to perform actions like exporting data or updating settings across locations.',
      position: 'top'
    },
    {
      id: 'completion',
      target: '[data-tour="brands-header"]',
      title: 'Tour Complete!',
      content: 'You now know how to navigate the brand management dashboard. Try clicking Edit on any location to explore detailed settings.',
      position: 'bottom'
    }
  ]
};

// General Tab Tour
export const generalTabTour: TourConfig = {
  id: 'general-tab-tour',
  title: 'General Settings Guide',
  description: 'Learn basic location settings and volume control',
  steps: [
    {
      id: 'basic-info',
      target: '[data-tour="basic-info-card"]',
      title: 'Location Information',
      content: 'This section shows your location details including name, description, and address.',
      position: 'bottom'
    },
    {
      id: 'live-streaming',
      target: '[data-tour="live-toggle"]',
      title: 'Live Streaming Control',
      content: 'Toggle this switch to turn music streaming on or off for this location.',
      position: 'left'
    },
    {
      id: 'volume-control',
      target: 'input[type="range"]',
      title: 'Volume Control',
      content: 'Adjust the audio volume for this location. Drag the slider to set the perfect sound level.',
      position: 'top'
    },
    {
      id: 'playlist-selection',
      target: '[data-tour="playlist-select"]',
      title: 'Current Playlist',
      content: 'Select which playlist should play at this location from the dropdown menu.',
      position: 'bottom'
    }
  ]
};

// Play Mode Tab Tour
export const playModeTabTour: TourConfig = {
  id: 'play-mode-tab-tour',
  title: 'Playback Mode Guide',
  description: 'Configure how music plays at your location',
  steps: [
    {
      id: 'playback-options',
      target: '[data-tour="playback-mode-options"]',
      title: 'Playback Modes',
      content: 'Choose between different playback modes: Single Playlist, Master Box Copy, or Time Slot Scheduling.',
      position: 'bottom'
    },
    {
      id: 'single-playlist-mode',
      target: 'input[value="single-playlist"]',
      title: 'Single Playlist Mode',
      content: 'Select this to play one playlist continuously at this location.',
      position: 'right'
    },
    {
      id: 'time-slot-mode',
      target: 'input[value="time-slot"]',
      title: 'Time Slot Scheduling',
      content: 'Choose this for advanced scheduling with different playlists at different times.',
      position: 'right'
    }
  ]
};

// Edit Playlist Tab Tour
export const editPlaylistTabTour: TourConfig = {
  id: 'edit-playlist-tab-tour',
  title: 'Playlist Editor Guide',
  description: 'Create and customize music playlists',
  steps: [
    {
      id: 'playlist-type-selector',
      target: '[data-tour="playlist-type-selector"]',
      title: 'Playlist Type',
      content: 'Choose between editing system playlists (read-only) or creating custom playlists.',
      position: 'bottom'
    },
    {
      id: 'song-library',
      target: '[data-tour="song-library"]',
      title: 'Song Library',
      content: 'Browse and search through available songs. Use filters to find specific genres or languages.',
      position: 'right'
    },
    {
      id: 'current-playlist',
      target: '[data-tour="current-playlist"]',
      title: 'Current Playlist',
      content: 'View and manage songs in your current playlist. Drag to reorder or click to remove songs.',
      position: 'left'
    },
    {
      id: 'add-songs',
      target: '[data-tour="add-songs-button"]',
      title: 'Add Songs',
      content: 'Select songs from the library and click "Add Selected" to include them in your playlist.',
      position: 'top'
    }
  ]
};

export const uploadJingleTour: TourConfig = {
  id: 'jingle-upload',
  title: 'Jingle Management',
  description: 'Learn how to upload, schedule, and manage custom jingles and voiceovers',
  steps: [
    {
      id: 'upload-area',
      target: '[data-tour="upload-zone"]',
      title: 'Upload Your Files',
      content: 'Drag and drop audio files here or click to browse. Supported formats: MP3, WAV, AAC up to 10MB.',
      position: 'bottom'
    },
    {
      id: 'file-details',
      target: '[data-tour="jingle-form"]',
      title: 'Jingle Information',
      content: 'Add a descriptive title and details about your jingle to help identify it later.',
      position: 'right'
    },
    {
      id: 'schedule-settings',
      target: '[data-tour="schedule-form"]',
      title: 'Playback Schedule',
      content: 'Set when your jingle should play - specific dates, times, and frequency settings.',
      position: 'left'
    },
    {
      id: 'preview-jingle',
      target: '[data-tour="preview-button"]',
      title: 'Preview Before Submit',
      content: 'Always preview your jingle to ensure quality and timing before submitting for approval.',
      position: 'top'
    },
    {
      id: 'approval-process',
      target: '[data-tour="submit-button"]',
      title: 'Submit for Review',
      content: 'Jingles are reviewed for quality and content guidelines. You\'ll be notified when approved (usually 1-2 business days).',
      position: 'top'
    }
  ]
};

export const allTours: Record<string, TourConfig> = {
  'brands-management': brandsTour,
  'general-tab-tour': generalTabTour,
  'play-mode-tab-tour': playModeTabTour,
  'edit-playlist-tab-tour': editPlaylistTabTour,
  'jingle-upload': uploadJingleTour,
};
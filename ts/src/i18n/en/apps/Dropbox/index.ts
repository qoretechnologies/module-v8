

const DropboxAppEn = {
  displayName: 'Dropbox',
  shortDesc:
    'A cloud storage service that lets you save files online and sync them to your devices.',
  longDesc:
    'Dropbox is a cloud-based file storage solution that allows users to store and share files and folders with others across the internet using file synchronization. It offers features like file sharing, collaboration, and access from multiple devices.',
  triggers: {
    new_file_in_folder: {
      displayName: 'New File in Folder',
      shortDesc: 'Triggers when a new file is added to a specified folder.',
      longDesc: 'This trigger fires every time a new file is saved in the folder you specify.',
      options: {
        folder: {
          displayName: 'Folder Path',
          shortDesc: 'The path to the folder to monitor for new files.',
          longDesc: 'Specify the path to the folder you want to monitor for new files. ',
        },
      },
    },
  },
};

export default DropboxAppEn;

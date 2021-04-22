new Vue({
  el: '#app',
  vuetify: new Vuetify({
    theme: { dark: true },
  }),
  data: () => ({
    showNavigation: null,
    navigationLinks: [
      {
        label: 'Home',
        href: './',
      },
      {
        label: 'Characters',
        children: [
          {
            label: 'Revolutionaries',
            children: [
              {
                label: 'Bean',
                href: './?page=bean',
              },
              {
                label: 'Chilli',
                href: './?page=chilli',
              },
              {
                label: 'Tomato',
                href: './?page=tomato',
              },
              {
                label: 'French Fry',
                href: './?page=frenchfry',
              },
            ],
          },
          {
            label: 'Traditionalists',
            children: [
              {
                label: 'Roger',
                href: './?page=roger',
              },
              {
                label: 'Joanne',
                href: './?page=joanne',
              },
              {
                label: 'Harper',
                href: './?page=tomato',
              },
            ],
          },
        ],
      },
      {
        label: 'World',
        children: [
          {
            label: 'WISDOM',
            href: './?page=wisdom',
          },
          {
            label: 'Class System',
            href: './?page=classsystem',
          },
          {
            label: 'Timeline',
            href: './?page=timeline',
          },
        ],
      },
    ],
    pageID: '',
    page: null,
    pageLoaded: false,
    canEdit: false,
    isEditingPage: false,
    isNewPage: false,
    uploadPageDialog: false,
    uploadPageValid: false,
    pageToUpload: null,
    uploadPageRules: [
      v => !!v || 'Required',
      v => !v || v.size < 100000000 || 'Less than 100 MB',
    ],
    pageTitleDialog: false,
    pageTitleValid: false,
    newPageTitle: '',
    textRules: [
      v => !!v || 'Required',
    ],
    sectionIndexToEdit: -1,
    isEditingText: false,
    addTextDialog: false,
    addTextValid: false,
    textToAdd: '',
    deleteTextDialog: false,
    isEditingImage: false,
    addImageValid: false,
    addImageDialog: false,
    imageToAdd: null,
    uploadImageRules: [
      v => !!v || 'Required',
      v => !v || v.size < 10000000 || 'Less than 10 MB',
    ],
    deleteImageDialog: false,
    isCharacter: false,
    characterEdit: {},
    editCharacterDialog: false,
    editCharacterValid: false,
    characterImageToUpload: null,
    uploadCharacterImageRules: [
      v => !v || v.size < 10000000 || 'Less than 10 MB',
    ],
  }),
  async created() {
    const searchParams = new URLSearchParams(location.search.substring(1));
    this.isNewPage = searchParams.get('new') !== null;
    this.pageID = this.isNewPage && this.canEdit ? 'template' : 'home';
    this.pageID = searchParams.get('page') ?? this.pageID;
    this.pageID = this.pageID.replace(/[\.\/]/g, '');
    await this.loadPage();
    this.pageLoaded = true;
    this.isCharacter = !!this.page.character;
  },
  methods: {
    async loadPage() {
      try {
        this.page = await $.getJSON(`./pages/${this.pageID}.json`);
        
        if (this.page) {
          document.title = this.page.title !== 'Home' ?
            `${this.page.title} | Fractured by Time`
            : 'Fractured by Time';
        }
      } catch (error) {
        console.log(error);
      }
    },
    downloadPage() {
      this.isEditingPage = false;
      
      const pageFile = new File([JSON.stringify(this.page)],
        "newpage.json", { type: "text/json" });
      const objectURL = URL.createObjectURL(pageFile);
      
      const link = document.createElement('a');
      link.href = objectURL;
      link.target = '_blank';
      link.download = objectURL;
      document.body.appendChild(link);
      link.click();
      
      URL.revokeObjectURL(objectURL);
    },
    uploadPage() {
      const reader = new FileReader();
      const vue = this;
      reader.onload = function() {
        vue.pageToUpload = null;
        vue.uploadPageDialog = false;
        vue.page = JSON.parse(reader.result);
        document.title = vue.page.title !== 'Home' ?
          `${vue.page.title} | Fractured by Time`
          : 'Fractured by Time';
      };
      reader.readAsText(this.pageToUpload);
    },
    cancelEditingPage() {
      this.isEditingPage = false;
      if (!this.page) return;
      this.loadPage();
    },
    editPageTitle() {
      this.pageTitleDialog = true;
      this.newPageTitle = this.page.title;
    },
    savePageTitle() {
      this.pageTitleDialog = false;
      this.page.title = this.newPageTitle;
    },
    addText() {
      this.page.sections.push({
        type: 'text',
        content: this.textToAdd,
      });
      this.textToAdd = '';
      this.addTextDialog = false;
    },
    editSectionText(index) {
      this.isEditingText = true;
      this.sectionIndexToEdit = index;
      this.textToAdd = this.page.sections[index].content;
      this.addTextDialog = true;
    },
    editText() {
      this.page.sections[this.sectionIndexToEdit].content = this.textToAdd;
      this.textToAdd = '';
      this.addTextDialog = false;
    },
    deleteSectionText(index) {
      this.sectionIndexToEdit = index;
      this.deleteTextDialog = true;
    },
    confirmDeleteText() {
      this.page.sections.splice(this.sectionIndexToEdit, 1);
      this.sectionIndexToEdit = -1;
      this.deleteTextDialog = false;
    },
    addImage() {
      const reader = new FileReader();
      const vue = this;
      reader.onload = function() {
        vue.page.sections.push({
          type: 'image',
          content: reader.result,
        });
        vue.imageToAdd = null;
        vue.addImageDialog = false;
      };
      reader.readAsDataURL(this.imageToAdd);
    },
    editImage() {
      const reader = new FileReader();
      const vue = this;
      reader.onload = function() {
        vue.page.sections[vue.sectionIndexToEdit].content = reader.result;
        vue.imageToAdd = null;
        vue.addImageDialog = false;
        vue.sectionIndexToEdit = -1;
      };
      reader.readAsDataURL(this.imageToAdd);
    },
    editSectionImage(index) {
      this.isEditingImage = true;
      this.sectionIndexToEdit = index;
      this.imageToAdd = null;
      this.addImageDialog = true;
    },
    deleteSectionImage(index) {
      this.sectionIndexToEdit = index;
      this.deleteImageDialog = true;
    },
    confirmDeleteImage() {
      this.page.sections.splice(this.sectionIndexToEdit, 1);
      this.sectionIndexToEdit = -1;
      this.deleteImageDialog = false;
    },
    addCharacterDetails() {
      this.page.character = {
        image: 'https://picsum.photos/id/11/500/300',
        name: 'Character',
        id: '1234567890',
        class: 'Lower',
        gender: 'Male',
        status: 'Alive',
        occupation: 'Janitor',
        affiliation: 'Revolutionists',
      };
      this.isCharacter = true;
    },
    editCharacterDetails() {
      this.editCharacterDialog = true;
      this.characterEdit = { ...this.page.character };
    },
    removeCharacterDetails() {
      delete this.page.character;
      this.isCharacter = false;
    },
    saveCharacterDetails() {
      this.page.character = { ...this.characterEdit };
      this.editCharacterDialog = false;
      
      if (this.characterImageToUpload) {
        const reader = new FileReader();
        const vue = this;
        reader.onload = function() {
          vue.page.character.image = reader.result;
          vue.characterImageToUpload = null;
        };
        reader.readAsDataURL(this.characterImageToUpload);
      }
    },
  },
});
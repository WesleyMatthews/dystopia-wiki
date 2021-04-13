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
        label: 'Example Page',
        href: './?page=example',
      },
      {
        label: 'Error 404 Page',
        href: './?page=',
      },
      {
        label: 'Container',
        children: [
          {
            label: 'Link',
            href: './?page=',
          },
        ],
      },
    ],
    pageID: '',
    page: null,
    pageLoaded: false,
    canEdit: true, // Change to false when submitting project.
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
  }),
  async created() {
    const searchParams = new URLSearchParams(location.search.substring(1));
    this.isNewPage = searchParams.get('new') !== null;
    this.pageID = this.isNewPage && this.canEdit ? 'template' : 'home';
    this.pageID = searchParams.get('page') ?? this.pageID;
    this.pageID = this.pageID.replace(/[\.\/]/g, '');
    await this.loadPage();
    this.pageLoaded = true;
  },
  methods: {
    async loadPage() {
      try {
        this.page = await $.getJSON(`./pages/${this.pageID}.json`);
        
        if (this.page) {
          document.title = this.page.title !== 'Home' ?
            `${this.page.title} | Dystopia Wiki`
            : 'Dystopia Wiki';
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
          `${vue.page.title} | Dystopia Wiki`
          : 'Dystopia Wiki';
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
  },
});
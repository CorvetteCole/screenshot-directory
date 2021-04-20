const {GObject, Gtk, Gio, GLib} = imports.gi;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

const PrefsWidget = GObject.registerClass({
    GTypeName: 'PrefsWidget',
    Template: Me.dir.get_child('prefs.ui').get_uri(),
    InternalChildren: [
        'file_chooser',
        'file_chooser_button',
    ],
}, class PrefsWidget extends Gtk.Box {

    _init(settings) {
        super._init();
        this._settings = settings;
        this._sync();
        this._settings.connect('changed', this._sync.bind(this));
    }
    
    _onChooseFileClicked(btn) {
        let parent = btn.get_root();
        this._file_chooser.set_transient_for(parent);
        this._file_chooser.show();
    }
    
    _onFileChooserResponse(native, response) {
        if (response !== Gtk.ResponseType.ACCEPT) {
            return;
        }
        let fileURI = native.get_file().get_uri();
        this._file_chooser_button.set_label(this._parseDir(fileURI));
        this._settings.set_string('auto-save-directory', fileURI);
    }
    
    _sync()
    {
        const dir = this._parseDir(this._settings.get_string('auto-save-directory'));
        if (GLib.file_test(dir, GLib.FileTest.EXISTS))
            this._file_chooser_button.set_label(Gio.File.new_for_path(dir));
    }
    
    _parseDir(dir) {
    	return dir.replace(/^file:\/\/\//, '/');
    }
    
});

function init() {
    //ExtensionUtils.initTranslations('my-gettext-domain');
}

function buildPrefsWidget() {
    return new PrefsWidget(new Gio.Settings({schema_id: 'org.gnome.gnome-screenshot'}));
}

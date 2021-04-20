const Screenshot = imports.ui.screenshot;
const GLib = imports.gi.GLib;
const Gio = imports.gi.Gio;

let _settings;

let ScreenshotService_resolveRelativeFilename;

function *_resolveRelativeFilename(filename)
{
    filename = filename.replace(/\.png$/, '');
    // alter the filename a bit
    // this helps differentiate between screenshots produced with this extension and those without it
    // replace ' from ' with '-', and separate the date & time with a ',' instead of a ' '
    let file = filename.replace(/\ from\ /, '-').replace(/\ /, ',');

    let path = [
        _settings.get_string('auto-save-directory').replace(/^file:\/\/\//, '/'),
        //GLib.get_user_special_dir(GLib.UserDirectory.DIRECTORY_PICTURES),
        GLib.get_home_dir(),
    ].find(p => GLib.file_test(p, GLib.FileTest.EXISTS));

    if (!path)
        return null;

    yield Gio.File.new_for_path(GLib.build_filenamev([path, `${file}.png`]));

    for (let idx = 1; ; idx++)
        yield Gio.File.new_for_path(GLib.build_filenamev([path, `${file}-${idx}.png`]));
}

function init()
{
    _settings = new Gio.Settings({schema_id: 'org.gnome.gnome-screenshot'});

    ScreenshotService_resolveRelativeFilename = Screenshot.ScreenshotService.prototype._resolveRelativeFilename;
}

function enable()
{
    Screenshot.ScreenshotService.prototype._resolveRelativeFilename = _resolveRelativeFilename.bind(this);
}

function disable()
{
    Screenshot.ScreenshotService.prototype._resolveRelativeFilename = ScreenshotService_resolveRelativeFilename;
}

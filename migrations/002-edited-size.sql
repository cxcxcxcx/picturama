-- Up

-- Changes on table photos:
--   - Add columns "edited_width" and "edited_height" (use values of "master_width" and "master_height" for migration)

PRAGMA foreign_keys=OFF;

DROP INDEX photos_master_dir_index;
CREATE TABLE "photos_new" (
    "id"              integer NOT NULL PRIMARY KEY AUTOINCREMENT,
    "master_dir"      text NOT NULL,
    "master_filename" text NOT NULL,
    "master_width"    integer NOT NULL,
    "master_height"   integer NOT NULL,
    "master_is_raw"   boolean NOT NULL DEFAULT '0',
    "edited_width"    integer NOT NULL,
    "edited_height"   integer NOT NULL,
    "date_section"    text NOT NULL,
    "created_at"      datetime NOT NULL,
    "updated_at"      datetime NOT NULL,
    "imported_at"     datetime NOT NULL,
    "orientation"     integer NOT NULL,
    "camera"          text,
    "exposure_time"   float,
    "iso"             integer,
    "focal_length"    integer,
    "aperture"        float,
    "flag"            boolean NOT NULL DEFAULT '0',
    "trashed"         boolean NOT NULL DEFAULT '0'
);
INSERT INTO photos_new (id, master_dir, master_filename, master_width, master_height, master_is_raw, edited_width, edited_height, date_section, created_at, updated_at, imported_at, orientation, camera, exposure_time, iso, focal_length, aperture, flag, trashed)
    SELECT id, master_dir, master_filename, master_width, master_height, master_is_raw, master_width, master_height, date_section, created_at, updated_at, imported_at, orientation, camera, exposure_time, iso, focal_length, aperture, flag, trashed
    FROM photos;
DROP TABLE photos;
ALTER TABLE photos_new RENAME TO photos;
CREATE INDEX photos_master_dir_index ON photos(master_dir);
CREATE INDEX photos_date_section_index ON photos(date_section);

PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- Down

PRAGMA foreign_keys=OFF;

DROP INDEX photos_master_dir_index;
DROP INDEX photos_date_section_index;
CREATE TABLE "photos" (
    "id"              integer NOT NULL PRIMARY KEY AUTOINCREMENT,
    "master_dir"      text NOT NULL,
    "master_filename" text NOT NULL,
    "master_width"    integer NOT NULL,
    "master_height"   integer NOT NULL,
    "master_is_raw"   boolean NOT NULL DEFAULT '0',
    "date_section"    text NOT NULL,
    "created_at"      datetime NOT NULL,
    "updated_at"      datetime NOT NULL,
    "imported_at"     datetime NOT NULL,
    "orientation"     integer NOT NULL,
    "camera"          text,
    "exposure_time"   float,
    "iso"             integer,
    "focal_length"    integer,
    "aperture"        float,
    "flag"            boolean NOT NULL DEFAULT '0',
    "trashed"         boolean NOT NULL DEFAULT '0'
);
INSERT INTO photos_new (id, master_dir, master_filename, master_width, master_height, master_is_raw, date_section, created_at, updated_at, imported_at, orientation, camera, exposure_time, iso, focal_length, aperture, flag, trashed)
    SELECT id, master_dir, master_filename, master_width, master_height, master_is_raw, date_section, created_at, updated_at, imported_at, orientation, camera, exposure_time, iso, focal_length, aperture, flag, trashed
    FROM photos;
DROP TABLE photos;
ALTER TABLE photos_new RENAME TO photos;
CREATE INDEX photos_master_dir_index ON photos(master_dir);

PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

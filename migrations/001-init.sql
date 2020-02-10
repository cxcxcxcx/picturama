-- Up

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
CREATE INDEX photos_master_dir_index ON photos(master_dir);
CREATE TABLE "tags" (
    "id"         integer NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title"      text NOT NULL,
    "slug"       text NOT NULL,
    "created_at" datetime NOT NULL,
    "updated_at" datetime
);
CREATE TABLE "photos_tags" (
    "photo_id" integer NOT NULL,
    "tag_id"   integer NOT NULL,
    FOREIGN KEY("photo_id") REFERENCES "photos"("id"),
    FOREIGN KEY("tag_id") REFERENCES "tags"("id"),
    PRIMARY KEY("photo_id","tag_id")
);
CREATE TABLE "versions" (
    "id"        integer NOT NULL PRIMARY KEY AUTOINCREMENT,
    "type"      text,
    "master"    text,
    "output"    text,
    "thumbnail" text,
    "version"   integer,
    "photo_id"  integer,
    FOREIGN KEY("photo_id") REFERENCES "photos"("id")
);

-- Down

DROP TABLE "versions";
DROP TABLE "photos_tags";
DROP TABLE "tags";
DROP INDEX photos_master_dir_index;
DROP TABLE "photos";

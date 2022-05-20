CREATE TABLE "users" (
  "id" bigserial PRIMARY KEY,
  "username" varchar NOT NULL,
  "email" varchar NOT NULL,
  "password" varchar NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT (now())
);

CREATE TABLE "roles" (
  "id" bigserial PRIMARY KEY,
  "name" bigint NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT (now())
);


CREATE INDEX ON "users" ("username", "email");

CREATE INDEX ON "roles" ("name");
#!/bin/sh
set -eu

case "${MYSQL_SHADOW_DATABASE}" in
  ''|*[!a-zA-Z0-9_]*)
    echo "MYSQL_SHADOW_DATABASE must contain only letters, numbers, and underscores" >&2
    exit 1
    ;;
esac

case "${MYSQL_USER}" in
  ''|*[!a-zA-Z0-9_]*)
    echo "MYSQL_USER must contain only letters, numbers, and underscores" >&2
    exit 1
    ;;
esac

mysql --protocol=socket -uroot -p"${MYSQL_ROOT_PASSWORD}" <<SQL
CREATE DATABASE IF NOT EXISTS \`${MYSQL_SHADOW_DATABASE}\`;
GRANT ALL PRIVILEGES ON \`${MYSQL_SHADOW_DATABASE}\`.* TO '${MYSQL_USER}'@'%';
FLUSH PRIVILEGES;
SQL

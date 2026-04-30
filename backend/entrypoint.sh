#!/bin/sh
set -e

echo "*** Compilando..."
mvn clean package -DskipTests

echo "*** Lanzando Spring..."
java -agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:5007 -jar target/mpaste-1.0.0.jar
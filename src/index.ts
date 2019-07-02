import resolve from "resolve-protobuf-schema";
import fs from "fs";

const schema = resolve.sync("./protobuf/OpenApiCommonMessages.proto");
fs.writeFileSync("abc.json", JSON.stringify(schema, null, 2));

resolve("./protobuf/OpenApiCommonMessages.proto", (err, schema) => {
  console.log("error", err);
  fs.writeFileSync("abc2.json", JSON.stringify(schema, null, 2));
});

// see compileRaw in compile.js
// https://github.com/mapbox/pbf/blob/master/compile.js#L16

// generate typescript based on .proto files
// generated typescript should be close to generated javascript by pbf

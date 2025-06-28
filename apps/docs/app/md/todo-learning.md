## Todo list to learn

- [ ] How to work variables environments in turborepo

```json
// "".env*""
{
    ...
    "format": {
      "dependsOn": ["^format"],
      "inputs": ["$TURBO_DEFAULT$", ".env*"]
    },
}
```

- [ ] How to work turborepo with `check-types`

```json
"check-types": {
      "dependsOn": ["^check-types"]
    },
```

- [ ] How to work turborepo with `["$TURBO_DEFAULT$", ".env*"]` to que se usa?

```json
  "format": {
      "dependsOn": ["^format"],
      "inputs": ["$TURBO_DEFAULT$", ".env*"]
    },
```

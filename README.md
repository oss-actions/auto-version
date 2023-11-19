# Validate the title on prudence pull requests

```yaml
name: PR Name Validation
on:
  pull_request:
    branches:
      - main
      - release/**
    types: [opened, edited, reopened]
jobs:
  lint:
    name: Validate Pull Request Name
    runs-on: ubuntu-latest
    steps:
      - uses: telenornorgeinternal/s07240-action-pr-title-parse-for-prudence@main
        with:
          title: ${{ github.event.pull_request.title }}
          summary: true
```

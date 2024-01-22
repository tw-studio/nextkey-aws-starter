# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## 0.0.1 — Fixes and Improvements (2024-01-19)

### Fixes

- [x] Removes dependency on Perl-based `rename` package in *create-nextkey-app.zsh*

### Improvements

- [x] Adds `useNextKey` setting to enable/disable NextKey portal.
- [x] Adds *run-certbot-live.sh* helper script to automate refreshing TLS certificate files on server and on S3 from running EC2 instance.
- [x] Adds *push-private-to-public.sh* helper script to interactively publish changes from a development branch to a publish remote.
- [x] Adds restrictive *robots.txt* at root and lockpage levels. Handle serving *robots.txt* when NextKey is enabled and no valid cookie is detected.
- [x] Adds rate limiting to the general server and to unlock requests.

### Tweaks

- [x] Renames `_guest` variation to variation `_one`
- [x] Clarifies in *README.md* that Git v2.28+ is required.
- [x] Minor clarifications and tweaks in comments and in strings.

## 0.0.0 — Start NextKey AWS Starter (2023-05-16)

This is the **first commit** forked from another project.

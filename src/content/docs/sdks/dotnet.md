---
title: .NET
description: Send the outcome receipt from .NET with HttpClient. There is no Crontinel package on NuGet.
---

Use the [HTTP check-in recipe](/check-in/recipes/) from .NET: one `POST /api/v1/ingest/cron` with the app ingest key, sent with `HttpClient`.

## Why there is no package

`dotnet add package Crontinel` fails: no Crontinel package is published on NuGet. The code in [crontinel/dotnet-sdk](https://github.com/crontinel/dotnet-sdk) has no release. This page will cover a package once one is published, sends the run receipt and has a maintainer.

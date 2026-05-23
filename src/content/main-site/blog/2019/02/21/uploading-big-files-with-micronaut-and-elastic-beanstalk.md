---
slug: 2019/02/21/uploading-big-files-with-micronaut-and-elastic-beanstalk
title: Uploading Big Files with Micronaut and Elastic Beanstalk
description: If you want to upload files with Micronaut, you may need to configure maximum request size and the max file size properties. Here’s how to do that.
date: '2019-02-21T12:48:36'
modified: '2021-02-19T17:54:27'
sourceUrl: https://micronaut.io/2019/02/21/uploading-big-files-with-micronaut-and-elastic-beanstalk/
wordpressId: 2940
contentSource: wordpress-post
category: uncategorized
categories:
  - uncategorized
tags:
  - aws
  - elasticbeanstalk
href: /2019/02/21/uploading-big-files-with-micronaut-and-elastic-beanstalk/
---

If you want to [upload files](https://docs.micronaut.io/1.1.0.M1/guide/index.html#uploads) with Micronaut, you may need to configure maximum request size and the max file size properties:

Here’s how to do that.

```yaml
micronaut:
    server:
       max-request-size: '100MB'
       multipart:
           max-file-size: '100MB'
```

If you wish to to deploy [AWS Elastic Beanstalk](https://aws.amazon.com/elasticbeanstalk/), an easy-to-use service for deploying and scaling web applications, you may get “413 Request Entity Too Large” errors when posting files larger than 10MB.

You can allow bigger file uploads by creating a file named `src/main/resources/.ebextensions/nginx/conf.d/proxy.conf` with content:

```text
client_max_body_size 100M;
```

To learn more, read [Configuring the Reverse Proxy](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/java-se-nginx.html) section in the Elastic Beanstalk documentation.

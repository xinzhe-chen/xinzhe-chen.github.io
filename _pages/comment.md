---
permalink: /comment/
title: "Comments"
excerpt: "Leave a note, ask a question, or say hello."
hide_page_title: true
author_profile: true
page_class: homepage
comment_page: true
---

<div class="comment-intro">
  <h1 id="comments">Comments</h1>
  <p>Leave a note, ask a question, or say hello.</p>
  <div class="comment-intro__links">
    <span><i class="fab fa-github" aria-hidden="true"></i> Sign in with GitHub to join the conversation.</span>
    <a href="mailto:asleep@u.nus.edu">Email me <span aria-hidden="true">&rarr;</span></a>
  </div>
</div>

<div class="comment-panel" id="comment-panel" data-state="loading" aria-label="Guestbook" data-theme-base="{{ site.giscus_theme_origin }}{{ '/assets/css/giscus' | relative_url }}" data-theme-version="3">
  <div class="comment-status" role="status" hidden>
    <div class="comment-loading" aria-hidden="true"><span></span><span></span><span></span></div>
    <p class="comment-status__text">Loading the conversation&hellip;</p>
    <div class="comment-status__actions" hidden>
      <button type="button" class="comment-retry">Try again</button>
      <a href="https://github.com/xinzhe-chen/xinzhe-chen.github.io/discussions/3">View on GitHub <span aria-hidden="true">&rarr;</span></a>
    </div>
  </div>
  <div class="giscus"></div>
  <noscript><p><a href="https://github.com/xinzhe-chen/xinzhe-chen.github.io/discussions/3">Read and join the conversation on GitHub.</a></p></noscript>
</div>

<script defer src="{{ '/assets/js/comments.js' | relative_url }}?v=3"></script>

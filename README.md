# Project 8: L'Oréal Chatbot

L’Oréal is exploring the power of AI, and your job is to showcase what's possible. Your task is to build a chatbot that helps users discover and understand L’Oréal’s extensive range of products—makeup, skincare, haircare, and fragrances—as well as provide personalized routines and recommendations.

## 🚀 Launch via GitHub Codespaces

1. In the GitHub repo, click the **Code** button and select **Open with Codespaces → New codespace**.
2. Once your codespace is ready, open the `index.html` file via the live preview.

## ☁️ Cloudflare Note

The chatbot in `script.js` sends messages to the class Cloudflare Worker at
`https://lorealchatbot.blaised381.workers.dev/`. The Worker keeps the
`OPENAI_API_KEY` secret; do not add the key to the frontend code. The request
body includes a `messages` array, and the reply is read from
`data.choices[0].message.content`.

The deployed Worker must run the code in `RESOURCE_cloudflare-worker.js`. In
the Cloudflare dashboard, open the Worker for the URL above, replace its script
with that file's contents, and deploy it. Make sure `OPENAI_API_KEY` is set as
a Worker secret. The script handles browser CORS preflight requests and returns
JSON errors when setup or upstream requests fail.

Enjoy building your L’Oréal beauty assistant! 💄

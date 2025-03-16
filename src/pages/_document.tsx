import React from 'react';
import { Html, Head, Main, NextScript, DocumentProps, DocumentContext } from 'next/document';
import { DocumentHeadTags, DocumentHeadTagsProps, documentGetInitialProps } from '@mui/material-nextjs/v14-pagesRouter';

export default function Document(props: DocumentProps & DocumentHeadTagsProps) {
  return (
    <Html lang="en" data-toolpad-color-scheme="light">
      <Head>
        <meta name="emotion-insertion-point" content="" />
        <DocumentHeadTags {...props} />
        <link rel="shortcut icon" href="/logo.svg" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

Document.getInitialProps = async (ctx: DocumentContext) => {
  const finalProps = await documentGetInitialProps(ctx);
  return finalProps;
};
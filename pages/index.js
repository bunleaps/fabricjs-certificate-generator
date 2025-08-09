import Head from "next/head";
import CertificateGenerator from "../components/CertificateGenerator/CertificateGenerator";

export default function Home() {
  return (
    <>
      <Head>
        <title>Certificate Generator</title>
        <meta
          name="description"
          content="Generate certificates in bulk from a template"
        />
      </Head>
      <main className="min-h-screen flex justify-center items-start bg-gray-100 p-6">
        <div className="max-w-4xl w-full bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-6 text-center">
            Certificate Generator
          </h1>
          <CertificateGenerator />
        </div>
      </main>
    </>
  );
}

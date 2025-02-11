import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import Carousel from "../../components/Carousel";
import getResults from "../../utils/cachedImages";
import getBase64ImageUrl from "../../utils/generateBlurPlaceholder";
import type { ImageProps } from "../../utils/types";

const Home: NextPage<{ currentPhoto: ImageProps }> = ({ currentPhoto }) => {
  const router = useRouter();
  const { photoId } = router.query;
  let index = Number(photoId);

  const currentPhotoUrl = `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/c_scale,w_2560/${currentPhoto.public_id}.${currentPhoto.format}`;

  return (
    <>
      <Head>
        <title>Next.js Cloudinary Photos</title>
        <meta property="og:image" content={currentPhotoUrl} />
        <meta name="twitter:image" content={currentPhotoUrl} />
      </Head>
      <main className="mx-auto max-w-[1960px] p-4">
        <Carousel currentPhoto={currentPhoto} index={index} />
      </main>
    </>
  );
};

export default Home;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const results = await getResults();

  let reducedResults: ImageProps[] = results.resources.map((result, i) => ({
    id: i,
    height: result.height,
    width: result.width,
    public_id: result.public_id,
    format: result.format,
  }));

  const currentPhoto = reducedResults.find(
    (img) => img.id === Number(context.params?.photoId)
  );

  if (!currentPhoto) {
    return { notFound: true }; // Handle missing images
  }

  currentPhoto.blurDataUrl = await getBase64ImageUrl(currentPhoto);

  return {
    props: {
      currentPhoto,
    },
  };
};

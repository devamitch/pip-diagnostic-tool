import React from 'react'
import Styles from './ProductCard.module.css'
import { ArticleCardData } from '@/types';
import Image from 'next/image';

function ProductCard({ title, description, image }: ArticleCardData) {
    return (
        <div className={Styles.card}>
                <Image
                    src={image}
                    alt={title}
                    width={300}
                    height={200}
                    className={Styles.image}
                />

            <div className={Styles.content}>
                <h3 className={Styles.title}>
                    {title}
                </h3>
                <p className={Styles.description}>{description}</p>
            </div>
        </div>
    );
}

export default ProductCard
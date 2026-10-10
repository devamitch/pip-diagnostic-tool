'use client';

import React from 'react';
import Image from 'next/image';
import Styles from './HospitalCard.module.css';

export interface HospitalCardData {
    title: string;
    description: string;
    image: string;
}

export default function HospitalCard({ title, description, image }: HospitalCardData) {
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

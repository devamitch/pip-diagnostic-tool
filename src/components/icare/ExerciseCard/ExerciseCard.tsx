import React from 'react'
import Styles from './ExerciseCard.module.css'
import { ExerciseCardData } from '@/types';
import Image from 'next/image';

function ExerciseCard({ title, image }: ExerciseCardData) {
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
            </div>
        </div>
    );
}

export default ExerciseCard
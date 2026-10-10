import React from 'react';
import styles from './ProfileCard.module.css';
import { Lock } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { ProfileCardProps } from '@/types';


function ProfileCard({ name, email, image }: ProfileCardProps) {
  return (
    <div className={styles.container}>
      <div className={styles.profileSection}>
        <Image
          src={image} 
          alt="Profile Image"
          width={36}
          height={36}
          className={styles.avatar}
        />
        <div>
          <h2 className={styles.title}>{name}</h2> 
          <p className={styles.subtitle}>{email}</p>
          <Link href="/dashboard" className={styles.button}>
            Let's check your Eye Health
          </Link>
        </div>
      </div>
      <Lock className={styles.icon} size={20} />
    </div>
  );
}

export default ProfileCard;
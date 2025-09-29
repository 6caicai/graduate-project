'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Hero } from '@/components/home/Hero'
import { FeaturedPhotos } from '@/components/home/FeaturedPhotos'
import { ActiveCompetitions } from '@/components/home/ActiveCompetitions'
import { PopularPhotographers } from '@/components/home/PopularPhotographers'
import { Statistics } from '@/components/home/Statistics'
import { PhotoThemes } from '@/components/home/PhotoThemes'

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

export default function HomePage() {
  return (
    <div className="space-y-12 lg:space-y-16">
      {/* 英雄区域 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <Hero />
      </motion.div>

      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="container mx-auto px-4 space-y-12 lg:space-y-16"
      >
        {/* 精选作品 */}
        <motion.section variants={fadeInUp} transition={{ duration: 0.6 }}>
          <FeaturedPhotos />
        </motion.section>

        {/* 活跃比赛 */}
        <motion.section variants={fadeInUp} transition={{ duration: 0.6 }}>
          <ActiveCompetitions />
        </motion.section>

        {/* 统计数据 */}
        <motion.section variants={fadeInUp} transition={{ duration: 0.6 }}>
          <Statistics />
        </motion.section>

        {/* 主题分类 */}
        <motion.section variants={fadeInUp} transition={{ duration: 0.6 }}>
          <PhotoThemes />
        </motion.section>

        {/* 热门摄影师 */}
        <motion.section variants={fadeInUp} transition={{ duration: 0.6 }}>
          <PopularPhotographers />
        </motion.section>
      </motion.div>
    </div>
  )
}



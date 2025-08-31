'use client'

import Link from 'next/link'
import { 
  CameraIcon,
  HeartIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline'

const footerLinks = {
  platform: [
    { name: '作品展示', href: '/photos' },
    { name: '摄影比赛', href: '/competitions' },
    { name: '摄影师预约', href: '/photographers' },
    { name: '排行榜', href: '/rankings' },
  ],
  help: [
    { name: '使用指南', href: '/help/guide' },
    { name: '常见问题', href: '/help/faq' },
    { name: '服务条款', href: '/terms' },
    { name: '隐私政策', href: '/privacy' },
  ],
  about: [
    { name: '关于我们', href: '/about' },
    { name: '联系我们', href: '/contact' },
    { name: '加入我们', href: '/careers' },
    { name: '合作伙伴', href: '/partners' },
  ],
}

const socialLinks = [
  { name: '微信', href: '#', icon: '📱' },
  { name: '微博', href: '#', icon: '🐦' },
  { name: 'QQ群', href: '#', icon: '💬' },
  { name: '邮箱', href: 'mailto:contact@campusphoto.com', icon: '✉️' },
]

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                <CameraIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                高校摄影系统
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              为高校学生提供专业的摄影作品展示、比赛参与和摄影师预约服务平台。
              发现美好瞬间，记录青春时光。
            </p>
            <div className="flex items-center space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center hover:bg-primary-100 dark:hover:bg-primary-900/20 transition-colors"
                  title={social.name}
                >
                  <span className="text-sm">{social.icon}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
              平台功能
            </h3>
            <ul className="space-y-3">
              {footerLinks.platform.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 text-sm transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
              帮助支持
            </h3>
            <ul className="space-y-3">
              {footerLinks.help.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 text-sm transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
              联系我们
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 text-sm">
                <EnvelopeIcon className="w-4 h-4" />
                <span>contact@campusphoto.com</span>
              </li>
              <li className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 text-sm">
                <PhoneIcon className="w-4 h-4" />
                <span>400-123-4567</span>
              </li>
              <li className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 text-sm">
                <MapPinIcon className="w-4 h-4" />
                <span>北京市海淀区学院路</span>
              </li>
            </ul>

            {/* Newsletter Subscription */}
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                订阅更新
              </h4>
              <div className="flex space-x-2">
                <input
                  type="email"
                  placeholder="输入邮箱地址"
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
                <button className="px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition-colors">
                  订阅
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="py-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-500 dark:text-gray-400 text-sm">
              © {currentYear} 高校摄影系统. 保留所有权利.
            </div>
            
            <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400 text-sm">
              <span>Made with</span>
              <HeartIcon className="w-4 h-4 text-red-500" />
              <span>for photography enthusiasts</span>
            </div>

            <div className="flex items-center space-x-6 text-sm">
              <Link
                href="/terms"
                className="text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                服务条款
              </Link>
              <Link
                href="/privacy"
                className="text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                隐私政策
              </Link>
              <Link
                href="/cookies"
                className="text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                Cookie政策
              </Link>
            </div>
          </div>
        </div>

        {/* Legal Notice */}
        <div className="py-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
            本平台仅供学习交流使用，上传内容版权归原作者所有。
            如有侵权，请联系我们删除。ICP备案号：京ICP备12345678号
          </p>
        </div>
      </div>
    </footer>
  )
}




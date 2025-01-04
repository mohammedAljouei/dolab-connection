import { motion } from "framer-motion";
import { MessageSquare } from "lucide-react";

export const EmptyState = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="text-center py-12"
  >
    <motion.div
      className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      <MessageSquare className="w-8 h-8 text-primary" />
    </motion.div>
    <h3 className="text-xl font-semibold mb-2">لا توجد منشورات بعد</h3>
    <p className="text-muted-foreground">كوني أول من يشارك في المجتمع</p>
  </motion.div>
);
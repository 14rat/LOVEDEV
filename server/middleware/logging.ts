import { Request, Response, NextFunction } from "express";
import fs from "fs/promises";
import path from "path";

interface LogEntry {
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR';
  method: string;
  url: string;
  ip: string;
  userAgent?: string;
  userId?: string;
  statusCode?: number;
  responseTime?: number;
  error?: string;
  details?: any;
}

class Logger {
  private logFile: string;

  constructor() {
    this.logFile = path.join(process.cwd(), 'logs', 'app.log');
    this.ensureLogDirectory();
  }

  private async ensureLogDirectory() {
    try {
      await fs.mkdir(path.dirname(this.logFile), { recursive: true });
    } catch (error) {
      console.error('Failed to create logs directory:', error);
    }
  }

  private async writeLog(entry: LogEntry) {
    try {
      const logLine = JSON.stringify(entry) + '\n';
      await fs.appendFile(this.logFile, logLine);
    } catch (error) {
      console.error('Failed to write log:', error);
    }
  }

  info(req: Request, message: string, details?: any) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'INFO',
      method: req.method,
      url: req.url,
      ip: req.ip || 'unknown',
      userAgent: req.get('User-Agent'),
      userId: req.user?.id,
      details
    };
    
    console.log(`[INFO] ${message}`, details || '');
    this.writeLog(entry);
  }

  warn(req: Request, message: string, details?: any) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'WARN',
      method: req.method,
      url: req.url,
      ip: req.ip || 'unknown',
      userAgent: req.get('User-Agent'),
      userId: req.user?.id,
      details
    };
    
    console.warn(`[WARN] ${message}`, details || '');
    this.writeLog(entry);
  }

  error(req: Request, message: string, error?: any, details?: any) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      method: req.method,
      url: req.url,
      ip: req.ip || 'unknown',
      userAgent: req.get('User-Agent'),
      userId: req.user?.id,
      error: error?.message || error?.toString(),
      details
    };
    
    console.error(`[ERROR] ${message}`, error || '', details || '');
    this.writeLog(entry);
  }
}

export const logger = new Logger();

// Request logging middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  // Log request
  logger.info(req, `${req.method} ${req.url} - Request started`);
  
  // Capture response
  const originalSend = res.send;
  res.send = function(body) {
    const responseTime = Date.now() - start;
    
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: res.statusCode >= 400 ? 'ERROR' : 'INFO',
      method: req.method,
      url: req.url,
      ip: req.ip || 'unknown',
      userAgent: req.get('User-Agent'),
      userId: req.user?.id,
      statusCode: res.statusCode,
      responseTime
    };
    
    console.log(`[${entry.level}] ${req.method} ${req.url} - ${res.statusCode} (${responseTime}ms)`);
    logger['writeLog'](entry);
    
    return originalSend.call(this, body);
  };
  
  next();
};
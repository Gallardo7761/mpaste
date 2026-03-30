package net.miarma.backend.mpaste.controller;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

@Controller
public class RTPasteController {
    private final RedisTemplate<String, Object> template;
    private static final String REDIS_PREFIX = "rt_paste:";

    public RTPasteController(RedisTemplate<String, Object> template) {
        this.template = template;
    }

    @MessageMapping("/edit/{key}")
    @SendTo("/topic/session/{key}")
    public Map<String, Object> handleUpdate(@DestinationVariable("key") String key, Map<String, Object> payload) {
        template.opsForValue().set(REDIS_PREFIX + key, payload, 24, TimeUnit.HOURS);
        return payload;
    }

    @MessageMapping("/join/{key}")
    @SendTo("/topic/session/{key}")
    public Map<String, Object> handleJoin(@DestinationVariable("key") String key) {
        Object data = template.opsForValue().get(REDIS_PREFIX + key);
        if (data instanceof Map) {
            return (Map<String, Object>) data;
        }
        return Map.of("content", "", "syntax", "plaintext", "title", "");
    }
}

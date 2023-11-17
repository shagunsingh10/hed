from abc import ABC, abstractmethod


class BaseQueueClient(ABC):
    def __init__(self, **kwargs):
        self.client = self.create_client(**kwargs)

    @abstractmethod
    def create_client(self, **kwargs):
        pass

    @abstractmethod
    def start_consuming(self, **kwargs):
        raise NotImplementedError(
            "start_consuming method must be implemented by a subclass."
        )
